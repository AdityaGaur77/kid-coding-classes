package org.firstinspires.ftc.teamcode;
import com.acmerobotics.roadrunner.Action;
import com.acmerobotics.roadrunner.Pose2d;
import com.acmerobotics.roadrunner.TrajectoryActionBuilder;
import com.acmerobotics.roadrunner.Vector2d;
import com.acmerobotics.roadrunner.ftc.Actions;
import com.qualcomm.robotcore.eventloop.opmode.Autonomous;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.CRServo;

@Autonomous(name = "right", group = "Autonomous")
public class autoleft extends LinearOpMode {
    private DcMotor longMotor;   // Slide motor
    private DcMotor highMotor;   // Pitch motor
    private CRServo claw;        // Claw servo

    // Constants for motor power
    // Default Slides Up Power
    private static final double DEFAULT_UP_POWER = 0.8;
    //Defaualt Slides Down Power
    private static final double DEFAULT_DOWN_POWER = 0.4;
    //Claw Holding Power
    private static final double HOLD_POWER = 0.1;
    //Arm Idle Power To Stay In Set Position
    private static final double IDLE_POWER = 0.0;

    // Current positions
    //Starting Initializing Positions for slides and pitch
    //TODO: When initialized the slides and the pitch will move try to move back to its original position for 1 second.
    private int currentSlidePosition = 0;
    private int currentPitchPosition = 0;

    @Override
    public void runOpMode() {
        // Initializing the position of the robot in the field.
        Pose2d initialPose = new Pose2d(0, 0, Math.toRadians(90));
        //Configuration parameters from the mecanum drive file that needs to be tuned everytime when hardware makes a change.
        MecanumDrive drive = new MecanumDrive(hardwareMap, initialPose);

        // Initialize motors and servo
        initializeHardware();

        waitForStart();

        if (isStopRequested()) return;

        movePitch(50,0.4);

        TrajectoryActionBuilder tab1 = drive.actionBuilder(initialPose)
                .strafeTo(new Vector2d(0,34));
                movePitch(480,0.5);
                movePitch(100,0.7);

        TrajectoryActionBuilder tab2 = drive.actionBuilder(drive.localizer.getPose())
                .strafeTo(new Vector2d(0,30))
                .strafeTo(new Vector2d(30,30));



        Actions.runBlocking(
                tab1.build()
        );
        Actions.runBlocking(
                tab2.build()
        );
    }

    // Initialize hardware components
    private void initializeHardware() {
        // Initialize motors
        longMotor = hardwareMap.get(DcMotor.class, "long");
        highMotor = hardwareMap.get(DcMotor.class, "high");
        claw = hardwareMap.get(CRServo.class, "claw");

        // Configure motors
        longMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        highMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);

        longMotor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        highMotor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);

        // Store initial positions
        currentSlidePosition = longMotor.getCurrentPosition();
        currentPitchPosition = highMotor.getCurrentPosition();
    }

    // Method to move slide motor up
    public void slideUp(int targetPosition) {
        moveSlide(targetPosition, DEFAULT_UP_POWER);
    }

    // Method to move slide motor down
    public void slideDown(int targetPosition) {
        moveSlide(targetPosition, -DEFAULT_DOWN_POWER);
    }
    public void pitchUp(int targetPosition) {
        movePitch(targetPosition, DEFAULT_UP_POWER);
    }

    // Method to move pitch motor down
    public void pitchDown(int targetPosition) {
        movePitch(targetPosition, -DEFAULT_DOWN_POWER);
    }

    // Base method to move slide motor to position
    private void moveSlide(int targetPosition, double power) {
        longMotor.setTargetPosition(targetPosition);
        longMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        longMotor.setPower(Math.abs(power));

        while (opModeIsActive() && longMotor.isBusy()) {
            telemetry.addData("Slide Position", longMotor.getCurrentPosition());
            telemetry.update();
        }

        currentSlidePosition = longMotor.getCurrentPosition();
        setSlideIdle();  // Sets to idle power after movement
    }

    // Base method to move pitch motor to position
    private void movePitch(int targetPosition, double power) {
        highMotor.setTargetPosition(targetPosition);
        highMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        highMotor.setPower(Math.abs(power));

        while (opModeIsActive() && highMotor.isBusy()) {
            telemetry.addData("Pitch Position", highMotor.getCurrentPosition());
            telemetry.update();
        }

        currentPitchPosition = highMotor.getCurrentPosition();
        setPitchIdle();  // Sets to idle power after movement
    }

    // Method to set slide to idle power
    public void setSlideIdle() {
        if (currentSlidePosition > 100) {  // If lifted, use hold power
            longMotor.setPower(HOLD_POWER);
        } else {  // If near bottom, use idle power
            longMotor.setPower(IDLE_POWER);
        }
    }

    // Method to set pitch to idle power
    public void setPitchIdle() {
        if (currentPitchPosition > 100) {  // If lifted, use hold power
            highMotor.setPower(HOLD_POWER);
        } else {  // If near bottom, use idle power
            highMotor.setPower(IDLE_POWER);
        }
    }

    // Method to control claw
    public void setClaw(boolean open) {
        double clawPower = open ? 1.0 : -1.0;
        claw.setPower(clawPower);
    }

    // Method to stop claw movement
    public void stopClaw() {
        claw.setPower(0);
    }
}