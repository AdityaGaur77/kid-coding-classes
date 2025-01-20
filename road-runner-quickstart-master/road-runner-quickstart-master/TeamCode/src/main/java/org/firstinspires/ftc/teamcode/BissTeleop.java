package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.robot.RobotState;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.Servo;
import com.qualcomm.robotcore.util.ElapsedTime;

@TeleOp(name="bis", group="Linear Opmode")
public class BissTeleop extends LinearOpMode {
    // Define motors and servos
    private DcMotor leftFrontDrive;  // Added for movement
    private DcMotor rightFrontDrive; // Added for movement
    private DcMotor leftBackDrive;   // Added for movement
    private DcMotor rightBackDrive;  // Added for movement
    private DcMotor pitchMotor;
    private DcMotor slideMotor;
    private Servo clawPivot;
    private Servo claw;

    // Constants for power and positions
    private static final double PITCH_POWER = 0.6;
    private static final double SLIDE_POWER = 0.8;
    private static final double DRIVE_POWER = 0.8; // Added for movement
    private static final double CLAW_OPEN = 0.5;
    private static final double CLAW_CLOSED = 0.0;
    private static final double CLAW_PIVOT_DOWN = 0.0;
    private static final double CLAW_PIVOT_UP = 1.0;
    private static final double CLAW_PIVOT_MIDDLE = 0.5;
    private static final double CLAW_PIVOT_INCREMENT = 0.01;
    private static final int PITCH_UP_200 = 115;
    private static final int PITCH_UP_500 = 573;
    private static final int SLIDES_OUT_500 = 823;
    private static final int SLIDES_FULL_OUT = 1647;

    // State enums
    private enum RobotState {
        BASKET,
        SUBMERSIBLE
    }

    private enum BasketState {
        READY,
        CLOSE_CLAW,
        MOVE_PITCH,
        MOVE_PIVOT,
        EXTEND_SLIDES,
        RELEASE_CLAW,
        RETRACT_SLIDES,
        RESET_PIVOT
    }

    private enum SubmersibleSequence {
        READY,
        PITCH_UP_200,
        PITCH_DOWN,
        SLIDES_OUT_500,
        SLIDES_IN,
        SLIDES_FULL_OUT,
        PITCH_UP_500
    }

    // State variables
    private RobotState currentState = RobotState.BASKET;
    private BasketState basketState = BasketState.READY;
    private SubmersibleSequence submersibleState = SubmersibleSequence.READY;
    private boolean yButtonPressed = false;
    private boolean bButtonPressed = false;
    private boolean xButtonPressed = false;
    private boolean aButtonPressed = false;
    private boolean basketBPressed = false;
    private double currentClawPivotPosition = CLAW_PIVOT_DOWN;

    private ElapsedTime runtime = new ElapsedTime();

    @Override
    public void runOpMode() {
        // Initialize hardware
        leftFrontDrive = hardwareMap.get(DcMotor.class, "leftFront");
        rightFrontDrive = hardwareMap.get(DcMotor.class, "rightFront");
        leftBackDrive = hardwareMap.get(DcMotor.class, "leftBack");
        rightBackDrive = hardwareMap.get(DcMotor.class, "rightBack");
        pitchMotor = hardwareMap.get(DcMotor.class, "high");
        slideMotor = hardwareMap.get(DcMotor.class, "long");
        clawPivot = hardwareMap.get(Servo.class, "clawPivot");
        claw = hardwareMap.get(Servo.class, "claw");

        // Configure drive motors
        leftFrontDrive.setDirection(DcMotor.Direction.REVERSE);
        leftBackDrive.setDirection(DcMotor.Direction.REVERSE);

        // Configure other motors
        pitchMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        slideMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);

        pitchMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        slideMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);

        // Initialize servo positions
        clawPivot.setPosition(CLAW_PIVOT_DOWN);
        claw.setPosition(CLAW_CLOSED);

        waitForStart();
        runtime.reset();

        while (opModeIsActive()) {
            handleStateTransitions();
            handleClawPivotControl();
            handleManualControls(); // New method for manual controls
            handleDriveMovement(); // New method for drive movement

            if (currentState == RobotState.BASKET) {
                handleBasketState();
            } else {
                handleSubmersibleSequence();
            }

            updateTelemetry();
        }
    }

    private void handleClawPivotControl() {
        if (gamepad1.dpad_up) {
            currentClawPivotPosition = Math.min(CLAW_PIVOT_UP, currentClawPivotPosition + CLAW_PIVOT_INCREMENT);
            clawPivot.setPosition(currentClawPivotPosition);
        }
        if (gamepad1.dpad_down) {
            currentClawPivotPosition = Math.max(CLAW_PIVOT_DOWN, currentClawPivotPosition - CLAW_PIVOT_INCREMENT);
            clawPivot.setPosition(currentClawPivotPosition);
        }
        if (gamepad1.dpad_right) {
            currentClawPivotPosition = CLAW_PIVOT_MIDDLE;
            clawPivot.setPosition(currentClawPivotPosition);
        }
    }

    private void handleStateTransitions() {
        // Handle Y button for state switching
        if (gamepad1.y && !yButtonPressed) {
            yButtonPressed = true;
            currentState = (currentState == RobotState.BASKET) ?
                    RobotState.SUBMERSIBLE : RobotState.BASKET;

            if (currentState == RobotState.BASKET) {
                basketState = BasketState.READY;
            } else {
                submersibleState = SubmersibleSequence.READY;
                resetPositions();
            }
        }
        yButtonPressed = gamepad1.y;

        // Handle A button for returning to READY state
        if (gamepad1.a && !aButtonPressed) {
            if (currentState == RobotState.BASKET) {
                basketState = BasketState.READY;
            } else {
                submersibleState = SubmersibleSequence.READY;
            }
            resetPositions();
        }
        aButtonPressed = gamepad1.a;
    }

    private void handleBasketState() {
        boolean bPressed = gamepad1.b;
        boolean xPressed = gamepad1.x;

        // Handle forward progression with B button
        if (bPressed && !basketBPressed) {
            progressBasketState();
        }
        // Handle backward progression with X button
        else if (xPressed && !xButtonPressed && basketState != BasketState.READY) {
            regressBasketState();
        }

        basketBPressed = bPressed;
        xButtonPressed = xPressed;
    }

    private void progressBasketState() {
        switch (basketState) {
            case READY:
                claw.setPosition(CLAW_CLOSED);
                basketState = BasketState.CLOSE_CLAW;
                break;
            case CLOSE_CLAW:
                movePitchToPosition(PITCH_UP_200);
                basketState = BasketState.MOVE_PITCH;
                break;
            case MOVE_PITCH:
                clawPivot.setPosition(CLAW_PIVOT_MIDDLE);
                currentClawPivotPosition = CLAW_PIVOT_MIDDLE;
                basketState = BasketState.MOVE_PIVOT;
                break;
            case MOVE_PIVOT:
                moveSlidesToPosition(SLIDES_OUT_500);
                basketState = BasketState.EXTEND_SLIDES;
                break;
            case EXTEND_SLIDES:
                claw.setPosition(CLAW_OPEN);
                basketState = BasketState.RELEASE_CLAW;
                break;
            case RELEASE_CLAW:
                moveSlidesToPosition(0);
                basketState = BasketState.RETRACT_SLIDES;
                break;
            case RETRACT_SLIDES:
                clawPivot.setPosition(CLAW_PIVOT_DOWN);
                currentClawPivotPosition = CLAW_PIVOT_DOWN;
                movePitchToPosition(0);
                basketState = BasketState.RESET_PIVOT;
                break;
            case RESET_PIVOT:
                basketState = BasketState.READY;
                break;
        }
    }

    private void regressBasketState() {
        switch (basketState) {
            case CLOSE_CLAW:
                basketState = BasketState.READY;
                claw.setPosition(CLAW_OPEN);
                break;
            case MOVE_PITCH:
                basketState = BasketState.CLOSE_CLAW;
                movePitchToPosition(0);
                break;
            case MOVE_PIVOT:
                basketState = BasketState.MOVE_PITCH;
                clawPivot.setPosition(CLAW_PIVOT_DOWN);
                currentClawPivotPosition = CLAW_PIVOT_DOWN;
                break;
            case EXTEND_SLIDES:
                basketState = BasketState.MOVE_PIVOT;
                moveSlidesToPosition(0);
                break;
            case RELEASE_CLAW:
                basketState = BasketState.EXTEND_SLIDES;
                claw.setPosition(CLAW_CLOSED);
                break;
            case RETRACT_SLIDES:
                basketState = BasketState.RELEASE_CLAW;
                moveSlidesToPosition(SLIDES_OUT_500);
                break;
            case RESET_PIVOT:
                basketState = BasketState.RETRACT_SLIDES;
                clawPivot.setPosition(CLAW_PIVOT_MIDDLE);
                currentClawPivotPosition = CLAW_PIVOT_MIDDLE;
                movePitchToPosition(PITCH_UP_200);
                break;
        }
    }

    private void handleSubmersibleSequence() {
        boolean bPressed = gamepad1.b;
        boolean xPressed = gamepad1.x;

        // Handle forward progression with B button
        if (bPressed && !bButtonPressed) {
            progressSubmersibleState();
        }
        // Handle backward progression with X button
        else if (xPressed && !xButtonPressed && submersibleState != SubmersibleSequence.READY) {
            regressSubmersibleState();
        }

        bButtonPressed = bPressed;
        xButtonPressed = xPressed;
    }

    private void progressSubmersibleState() {
        switch (submersibleState) {
            case READY:
                movePitchToPosition(PITCH_UP_200);
                submersibleState = SubmersibleSequence.PITCH_UP_200;
                break;
            case PITCH_UP_200:
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
                submersibleState = SubmersibleSequence.READY;
                resetPositions();
                break;
        }
    }

    private void regressSubmersibleState() {
        switch (submersibleState) {
            case PITCH_UP_200:
                submersibleState = SubmersibleSequence.READY;
                movePitchToPosition(0);
                break;
            case PITCH_DOWN:
                submersibleState = SubmersibleSequence.PITCH_UP_200;
                movePitchToPosition(PITCH_UP_200);
                break;
            case SLIDES_OUT_500:
                submersibleState = SubmersibleSequence.PITCH_DOWN;
                moveSlidesToPosition(0);
                break;
            case SLIDES_IN:
                submersibleState = SubmersibleSequence.SLIDES_OUT_500;
                moveSlidesToPosition(SLIDES_OUT_500);
                break;
            case SLIDES_FULL_OUT:
                submersibleState = SubmersibleSequence.SLIDES_IN;
                moveSlidesToPosition(0);
                break;
            case PITCH_UP_500:
                submersibleState = SubmersibleSequence.SLIDES_FULL_OUT;
                movePitchToPosition(0);
                break;
        }
    }

    private void handleManualControls() {
        // Pitch control with triggers
        double pitchPower = gamepad1.right_trigger - gamepad1.left_trigger;
        pitchMotor.setPower(pitchPower * PITCH_POWER);

        // Slide control with bumpers
        if (gamepad1.right_bumper) {
            slideMotor.setPower(SLIDE_POWER);
        } else if (gamepad1.left_bumper) {
            slideMotor.setPower(-SLIDE_POWER);
        } else {
            slideMotor.setPower(0);
        }
    }

    private void handleDriveMovement() {
        double drive = -gamepad1.left_stick_y;
        double strafe = gamepad1.left_stick_x;
        double turn = gamepad1.right_stick_x;

        // Calculate wheel powers using mecanum drive formula
        double leftFrontPower = drive + strafe + turn;
        double rightFrontPower = drive - strafe - turn;
        double leftBackPower = drive - strafe + turn;
        double rightBackPower = drive + strafe - turn;

        // Normalize wheel powers
        double max = Math.max(Math.abs(leftFrontPower), Math.max(Math.abs(rightFrontPower),
                Math.max(Math.abs(leftBackPower), Math.abs(rightBackPower))));
        if (max > 1.0) {
            leftFrontPower /= max;
            rightFrontPower /= max;
            leftBackPower /= max;
            rightBackPower /= max;
        }

        // Apply drive power scale
        // Apply drive power scale
        leftFrontDrive.setPower(leftFrontPower * DRIVE_POWER);
        rightFrontDrive.setPower(rightFrontPower * DRIVE_POWER);
        leftBackDrive.setPower(leftBackPower * DRIVE_POWER);
        rightBackDrive.setPower(rightBackPower * DRIVE_POWER);
    }

    private void movePitchToPosition(int position) {
        pitchMotor.setTargetPosition(position);
        pitchMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        pitchMotor.setPower(PITCH_POWER);
    }

    private void moveSlidesToPosition(int position) {
        slideMotor.setTargetPosition(position);
        slideMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        slideMotor.setPower(SLIDE_POWER);
    }

    private void resetPositions() {
        movePitchToPosition(0);
        moveSlidesToPosition(0);
        if (currentState == RobotState.BASKET) {
            clawPivot.setPosition(CLAW_PIVOT_DOWN);
            currentClawPivotPosition = CLAW_PIVOT_DOWN;
        }
    }

    private void updateTelemetry() {
        telemetry.addData("Status", "Run Time: " + runtime.toString());
        telemetry.addData("Robot State", currentState);
        telemetry.addData("Basket State", basketState);
        telemetry.addData("Submersible Sequence", submersibleState);
        telemetry.addData("Pitch Position", pitchMotor.getCurrentPosition());
        telemetry.addData("Slide Position", slideMotor.getCurrentPosition());
        telemetry.addData("Claw Pivot Position", currentClawPivotPosition);
        telemetry.addData("Drive Motors", String.format("LF: %.2f, RF: %.2f, LB: %.2f, RB: %.2f",
                leftFrontDrive.getPower(), rightFrontDrive.getPower(),
                leftBackDrive.getPower(), rightBackDrive.getPower()));
        telemetry.update();
    }
}