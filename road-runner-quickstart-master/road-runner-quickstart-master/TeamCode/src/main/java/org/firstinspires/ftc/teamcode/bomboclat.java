package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.CRServo;
import com.qualcomm.robotcore.hardware.Servo;
import com.qualcomm.robotcore.util.ElapsedTime;
import com.qualcomm.robotcore.util.Range;

@TeleOp(name="bis_optimized", group="Linear Opmode")
public class bomboclat extends LinearOpMode {
    // Original motors
    private DcMotor leftFrontDrive;
    private DcMotor rightFrontDrive;
    private DcMotor leftBackDrive;
    private DcMotor rightBackDrive;
    private DcMotor pitchMotor;
    private DcMotor slideMotor;

    // Add claw servos
    private CRServo clawServo;
    private CRServo clawPivotServo;
    private CRServo clawRotationServo;

    // Claw control variables
    private double clawPower = 0;
    private double clawPivotPower = 0;
    private double clawRotationPower = 0;
    private boolean isClawClosed = false;

    // Claw constants
    private static final double CLAW_OPEN_POWER = 0.65;
    private static final double CLAW_CLOSE_POWER = -0.65;
    private static final double CLAW_STOP_POWER = 0.0;
    private static final double SERVO_INCREMENT = 0.2;

    // Previous button states
    private boolean dpadUpPrev = false;
    private boolean dpadDownPrev = false;
    private boolean dpadLeftPrev = false;
    private boolean dpadRightPrev = false;
    private boolean leftStickButtonPrev = false;
    private boolean rightStickButtonPrev = false;
    private boolean xButtonPrev = false;


    private static final double SERVO_HOLD_POWER = 0.5; // Power when holding d-pad


    private static final double PITCH_POWER = 0.4;
    private static final double PITCH_POWER_REDUCED = 0.2;
    private static final double PITCH_POWER_HANG = 1.0;
    private static final double SLIDE_POWER = 0.6;
    private static final double DRIVE_POWER = 0.7;


    // Position constants
    private static final int PITCH_UP_200 = 115;
    private static final int PITCH_UP_500 = 573;
    private static final int SLIDES_OUT_500 = 823;
    private static final int SLIDES_FULL_OUT = 1700;
    private static final int PITCH_MAX_POSITION = 950;
    private static final int SLIDE_MAX_POSITION = 2200;
    private static final int SLIDES_OUT_200 = 600;

    private ElapsedTime clawTimer = new ElapsedTime();
    private static final double CLAW_OPERATION_TIME = 0.2; // Time in seconds for claw to open/close

    // Updated State enums
    private enum RobotState { SPECIMEN, SUBMERSIBLE, BASKET, HANG }
    private enum SpecimenState {
        READY, SLIDES_OUT, PITCH_UP, SLIDES_IN, RESET
    }
    private enum SubmersibleSequence {
        READY, PITCH_UP_200, CLAW_PIVOT, PITCH_DOWN, SLIDES_OUT_500,
        SLIDES_IN, SLIDES_FULL_OUT, PITCH_UP_500
    }
    private enum BasketSequence {
        READY, PITCH_UP_200, CLAW_PIVOT, PITCH_DOWN, SLIDES_OUT_500,
        SLIDES_IN, SLIDES_FULL_OUT, PITCH_UP_500
    }

    private enum HangState { READY, PITCH_BACK }


    private HangState hangState = HangState.READY;

    // State variables
    private RobotState currentState = RobotState.SPECIMEN;
    private SpecimenState specimenState = SpecimenState.READY;
    private SubmersibleSequence submersibleState = SubmersibleSequence.READY;
    private BasketSequence basketState = BasketSequence.READY;

    private boolean yButtonPressed = false;
    private boolean bButtonPressed = false;
    private boolean xButtonPressed = false;
    private boolean aButtonPressed = false;


    // Motor state tracking
    private boolean pitchMoving = false;
    private boolean slideMoving = false;
    private final ElapsedTime runtime = new ElapsedTime();

    @Override
    public void runOpMode() {
        initializeHardware();
        waitForStart();
        runtime.reset();

        while (opModeIsActive()) {
            handleDriveMovement();
            handleStateTransitions();
            handleClawControl();
            handleCurrentState();
            handleManualControls();
            updateTelemetry();
        }
    }


    private void initializeHardware() {
        // Initialize original hardware
        leftFrontDrive = hardwareMap.get(DcMotor.class, "leftFront");
        rightFrontDrive = hardwareMap.get(DcMotor.class, "rightFront");
        leftBackDrive = hardwareMap.get(DcMotor.class, "leftBack");
        rightBackDrive = hardwareMap.get(DcMotor.class, "rightBack");
        pitchMotor = hardwareMap.get(DcMotor.class, "high");
        slideMotor = hardwareMap.get(DcMotor.class, "long");

        // Initialize claw servos
        clawServo = hardwareMap.get(CRServo.class, "claw");
        clawPivotServo = hardwareMap.get(CRServo.class, "clawPivot");
        clawRotationServo = hardwareMap.get(CRServo.class, "clawrotation");

        // Configure motors
        pitchMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        slideMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        leftFrontDrive.setDirection(DcMotor.Direction.REVERSE);
        leftBackDrive.setDirection(DcMotor.Direction.REVERSE);
        pitchMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        slideMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        pitchMotor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        slideMotor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);

        // Initialize servos to stopped position
        clawServo.setPower(0);
        clawPivotServo.setPower(0);
        clawRotationServo.setPower(0);
    }

    private void handleClawControl() {
        // Toggle claw open/close with X button
        if (gamepad1.x && !xButtonPrev) {
            if (isClawClosed) {
                clawServo.setPower(CLAW_OPEN_POWER);
                isClawClosed = false;
            } else {
                clawServo.setPower(CLAW_CLOSE_POWER);
                isClawClosed = true;
            }
        }
        xButtonPrev = gamepad1.x;

        // Claw Pivot Control (D-pad up/down)
        if (gamepad1.dpad_up) {
            if (!dpadUpPrev) { // Initial press
                clawPivotPower = Range.clip(clawPivotPower + SERVO_INCREMENT, -1.0, 1.0);
            }
            // Continuous movement while held
            clawPivotServo.setPower(SERVO_HOLD_POWER);
        } else if (gamepad1.dpad_down) {
            if (!dpadDownPrev) { // Initial press
                clawPivotPower = Range.clip(clawPivotPower - SERVO_INCREMENT, -1.0, 1.0);
            }
            // Continuous movement while held
            clawPivotServo.setPower(-SERVO_HOLD_POWER);
        } else {
            clawPivotServo.setPower(clawPivotPower); // Maintain last set position when not pressed
        }
        dpadUpPrev = gamepad1.dpad_up;
        dpadDownPrev = gamepad1.dpad_down;

        // Claw Rotation Control (D-pad left/right)
        if (gamepad1.dpad_left) {
            if (!dpadLeftPrev) { // Initial press
                clawRotationPower = Range.clip(clawRotationPower - SERVO_INCREMENT, -1.0, 1.0);
            }
            // Continuous movement while held
            clawRotationServo.setPower(-SERVO_HOLD_POWER);
        } else if (gamepad1.dpad_right) {
            if (!dpadRightPrev) { // Initial press
                clawRotationPower = Range.clip(clawRotationPower + SERVO_INCREMENT, -1.0, 1.0);
            }
            // Continuous movement while held
            clawRotationServo.setPower(SERVO_HOLD_POWER);
        } else {
            clawRotationServo.setPower(clawRotationPower); // Maintain last set position when not pressed
        }
        dpadLeftPrev = gamepad1.dpad_left;
        dpadRightPrev = gamepad1.dpad_right;
    }

    private void handleCurrentState() {
        switch (currentState) {
            case SPECIMEN:
                handleSpecimenState();
                break;
            case SUBMERSIBLE:
                handleSubmersibleSequence();
                break;
            case BASKET:
                handleBasketSequence();
                break;
        }
    }

    private void handleManualControls() {
        double pitchInput = gamepad1.right_trigger - gamepad1.left_trigger;

        // Pitch control with deadzone and power optimization
        if (Math.abs(pitchInput) > 0.1) {
            pitchMoving = true;
            pitchMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);

            // Apply power with position limits
            double pitchPower = 0;
            if ((pitchMotor.getCurrentPosition() < PITCH_MAX_POSITION || pitchInput < 0) &&
                    (pitchMotor.getCurrentPosition() > 0 || pitchInput > 0)) {
                pitchPower = pitchInput * PITCH_POWER;
            }

            pitchMotor.setPower(pitchPower);
        } else if (pitchMoving) {
            pitchMotor.setPower(0);
            pitchMoving = false;
            // Hold position when manual control ends
            movePitchToPosition(pitchMotor.getCurrentPosition());
        }

        // Slide control with optimized power
        if (gamepad1.right_bumper || gamepad1.left_bumper) {
            slideMoving = true;
            slideMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);

            double slidePower = 0;
            if (gamepad1.right_bumper && slideMotor.getCurrentPosition() < SLIDE_MAX_POSITION) {
                slidePower = SLIDE_POWER;
            } else if (gamepad1.left_bumper && slideMotor.getCurrentPosition() > 0) {
                slidePower = -SLIDE_POWER;
            }

            slideMotor.setPower(slidePower);
        } else if (slideMoving) {
            slideMotor.setPower(0);
            slideMoving = false;
            // Hold position when manual control ends
            moveSlidesToPosition(slideMotor.getCurrentPosition());
        }
    }


    private void handleDriveMovement() {
        double drive = -gamepad1.left_stick_y;
        double strafe = gamepad1.left_stick_x;
        double turn = gamepad1.right_stick_x;

        // Only calculate and apply power if there's significant input
        if (Math.abs(drive) > 0.1 || Math.abs(strafe) > 0.1 || Math.abs(turn) > 0.1) {
            // Calculate wheel powers
            double[] powers = new double[4];
            powers[0] = drive + strafe + turn;  // Left Front
            powers[1] = drive - strafe - turn;  // Right Front
            powers[2] = drive - strafe + turn;  // Left Back
            powers[3] = drive + strafe - turn;  // Right Back

            // Normalize powers
            double max = Math.abs(powers[0]);
            for (int i = 1; i < 4; i++) {
                max = Math.max(max, Math.abs(powers[i]));
            }
            if (max > 1.0) {
                for (int i = 0; i < 4; i++) {
                    powers[i] /= max;
                }
            }

            // Apply powers
            leftFrontDrive.setPower(powers[0] * DRIVE_POWER);
            rightFrontDrive.setPower(powers[1] * DRIVE_POWER);
            leftBackDrive.setPower(powers[2] * DRIVE_POWER);
            rightBackDrive.setPower(powers[3] * DRIVE_POWER);
        } else {
            // Stop motors if no significant input
            leftFrontDrive.setPower(0);
            rightFrontDrive.setPower(0);
            leftBackDrive.setPower(0);
            rightBackDrive.setPower(0);
        }
    }

    // Simplified movement methods
    private void movePitchToPosition(int targetPosition) {
        // Add hard stop check
        if (targetPosition > PITCH_MAX_POSITION) {
            targetPosition = PITCH_MAX_POSITION;
        } else if (targetPosition < 0) {
            targetPosition = 0;
        }

        pitchMotor.setTargetPosition(targetPosition);
        pitchMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        pitchMotor.setPower(PITCH_POWER);
    }

    private void moveSlidesToPosition(int targetPosition) {
        targetPosition = Range.clip(targetPosition, 0, SLIDE_MAX_POSITION);
        slideMotor.setTargetPosition(targetPosition);
        slideMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        slideMotor.setPower(SLIDE_POWER);
    }

    private BasketSequence getPreviousBasketState() {
        switch (basketState) {
            case PITCH_UP_200: return BasketSequence.READY;
            case CLAW_PIVOT: return BasketSequence.PITCH_UP_200;
            case PITCH_DOWN: return BasketSequence.CLAW_PIVOT;
            case SLIDES_OUT_500: return BasketSequence.PITCH_DOWN;
            case SLIDES_IN: return BasketSequence.SLIDES_OUT_500;
            case SLIDES_FULL_OUT: return BasketSequence.SLIDES_IN;
            case PITCH_UP_500: return BasketSequence.SLIDES_FULL_OUT;
            default: return basketState;
        }
    }

    private void handleBasketSequence() {
        if (gamepad1.b && !bButtonPressed) {
            switch (basketState) {
                case READY:
                    movePitchToPosition(PITCH_UP_200);
                    basketState = BasketSequence.PITCH_UP_200;
                    break;
                case PITCH_UP_200:
                    basketState = BasketSequence.CLAW_PIVOT;
                    break;
                case CLAW_PIVOT:
                    movePitchToPosition(0);
                    basketState = BasketSequence.PITCH_DOWN;
                    break;
                case PITCH_DOWN:
                    moveSlidesToPosition(SLIDES_OUT_500);
                    basketState = BasketSequence.SLIDES_OUT_500;
                    break;
                case SLIDES_OUT_500:
                    moveSlidesToPosition(0);
                    basketState = BasketSequence.SLIDES_IN;
                    break;
                case SLIDES_IN:
                    moveSlidesToPosition(SLIDES_FULL_OUT);
                    basketState = BasketSequence.SLIDES_FULL_OUT;
                    break;
                case SLIDES_FULL_OUT:
                    movePitchToPosition(PITCH_UP_500);
                    basketState = BasketSequence.PITCH_UP_500;
                    break;
                case PITCH_UP_500:
                    resetPositions();
                    basketState = BasketSequence.READY;
                    break;
            }
        }
        bButtonPressed = gamepad1.b;
    }

    // State handling methods (implementations remain similar but simplified)
    private void handleStateTransitions() {

        if (gamepad1.y && !yButtonPressed) {
            yButtonPressed = true;
            switch (currentState) {
                case SPECIMEN:
                    currentState = RobotState.SUBMERSIBLE;
                    break;
                case SUBMERSIBLE:
                    currentState = RobotState.BASKET;
                    break;
                case BASKET:
                    currentState = RobotState.HANG;
                    break;
                case HANG:
                    currentState = RobotState.SPECIMEN;
                    break;
            }
            resetPositions();
        }
        yButtonPressed = gamepad1.y;

        if (gamepad1.y && !yButtonPressed) {
            yButtonPressed = true;
            switch (currentState) {
                case SPECIMEN:
                    currentState = RobotState.SUBMERSIBLE;
                    break;
                case SUBMERSIBLE:
                    currentState = RobotState.BASKET;
                    break;
                case BASKET:
                    currentState = RobotState.SPECIMEN;
                    break;
            }
            resetPositions();
        }
        yButtonPressed = gamepad1.y;

        // Back one state (X button)
        if (gamepad1.x && !xButtonPressed) {
            xButtonPressed = true;
            switch (currentState) {
                case SPECIMEN:
                    specimenState = getPreviousSpecimenState();
                    break;
                case SUBMERSIBLE:
                    submersibleState = getPreviousSubmersibleState();
                    break;
                case BASKET:
                    basketState = getPreviousBasketState();
                    break;
            }
        }
        xButtonPressed = gamepad1.x;


        // Mode switch (Y button)
        if (gamepad1.y && !yButtonPressed) {
            yButtonPressed = true;
            currentState = (currentState == RobotState.SPECIMEN) ?
                    RobotState.SUBMERSIBLE : RobotState.SPECIMEN;
            resetPositions();
        }
        yButtonPressed = gamepad1.y;

        // Back one state (X button)
        if (gamepad1.x && !xButtonPressed) {
            xButtonPressed = true;
            if (currentState == RobotState.SPECIMEN) {
                specimenState = getPreviousSpecimenState();
            } else {
                submersibleState = getPreviousSubmersibleState();
            }
        }
        xButtonPressed = gamepad1.x;

        // Reset (A button)
        if (gamepad1.a && !aButtonPressed) {
            resetPositions();
        }
        aButtonPressed = gamepad1.a;
    }

    private SubmersibleSequence getPreviousSubmersibleState() {
        switch (submersibleState) {
            case PITCH_UP_200: return SubmersibleSequence.READY;
            case CLAW_PIVOT: return SubmersibleSequence.PITCH_UP_200;
            case PITCH_DOWN: return SubmersibleSequence.CLAW_PIVOT;
            case SLIDES_OUT_500: return SubmersibleSequence.PITCH_DOWN;
            case SLIDES_IN: return SubmersibleSequence.SLIDES_OUT_500;
            case SLIDES_FULL_OUT: return SubmersibleSequence.SLIDES_IN;
            case PITCH_UP_500: return SubmersibleSequence.SLIDES_FULL_OUT;
            default: return submersibleState;
        }
    }

    private void handleSpecimenState() {
        if (gamepad1.b && !bButtonPressed) {
            switch (specimenState) {
                case READY:
                    moveSlidesToPosition(SLIDES_OUT_200);
                    specimenState = SpecimenState.SLIDES_OUT;
                    break;
                case SLIDES_OUT:
                    movePitchToPosition(PITCH_UP_500);
                    specimenState = SpecimenState.PITCH_UP;
                    break;
                case PITCH_UP:
                    moveSlidesToPosition(0);
                    specimenState = SpecimenState.SLIDES_IN;
                    break;
                case SLIDES_IN:
                    resetPositions();
                    specimenState = SpecimenState.RESET;
                    break;
                case RESET:
                    specimenState = SpecimenState.READY;
                    break;
            }
        }
        bButtonPressed = gamepad1.b;
    }

    private SpecimenState getPreviousSpecimenState() {
        switch (specimenState) {
            case SLIDES_OUT: return SpecimenState.READY;
            case PITCH_UP: return SpecimenState.SLIDES_OUT;
            case SLIDES_IN: return SpecimenState.PITCH_UP;
            case RESET: return SpecimenState.SLIDES_IN;
            default: return specimenState;
        }
    }


    private void handleSubmersibleSequence() {
        if (gamepad1.b && !bButtonPressed) {
            switch (submersibleState) {
                case READY:
                    movePitchToPosition(PITCH_UP_200);
                    submersibleState = SubmersibleSequence.PITCH_UP_200;
                    break;
                case PITCH_UP_200:
                    submersibleState = SubmersibleSequence.CLAW_PIVOT;
                    break;
                case CLAW_PIVOT:
                    movePitchToPosition(0);
                    submersibleState = SubmersibleSequence.PITCH_DOWN;
                    break;
                case PITCH_DOWN:
                    moveSlidesToPosition(SLIDES_OUT_500);
                    submersibleState = SubmersibleSequence.SLIDES_OUT_500;
                    break;
                case SLIDES_OUT_500:
                    moveSlidesToPosition(0);
                    submersibleState = SubmersibleSequence.SLIDES_IN;
                    break;
                case SLIDES_IN:
                    moveSlidesToPosition(SLIDES_FULL_OUT);
                    submersibleState = SubmersibleSequence.SLIDES_FULL_OUT;
                    break;
                case SLIDES_FULL_OUT:
                    movePitchToPosition(PITCH_UP_500);
                    submersibleState = SubmersibleSequence.PITCH_UP_500;
                    break;
                case PITCH_UP_500:
                    resetPositions();
                    submersibleState = SubmersibleSequence.READY;
                    break;
            }
        }
        bButtonPressed = gamepad1.b;
    }

    private void resetPositions() {
        movePitchToPosition(0);
        moveSlidesToPosition(0);
    }

    private void updateTelemetry() {
        telemetry.addData("Status", "Run Time: " + runtime.toString());
        telemetry.addData("Claw Power", "%.2f", clawPower);
        telemetry.addData("Claw Pivot Power", "%.2f", clawPivotPower);
        telemetry.addData("Claw Rotation Power", "%.2f", clawRotationPower);
        telemetry.addData("Pitch Position", pitchMotor.getCurrentPosition());
        telemetry.addData("Pitch Target", pitchMotor.getTargetPosition());
        telemetry.addData("Pitch Power", pitchMotor.getPower());
        telemetry.addData("Slide Position", slideMotor.getCurrentPosition());
        telemetry.addData("Slide Target", slideMotor.getTargetPosition());
        telemetry.addData("Slide Power", slideMotor.getPower());
        telemetry.addData("Claw State", isClawClosed ? "Closed" : "Open");
        telemetry.addData("Current State", currentState);
        telemetry.update();
    }
}