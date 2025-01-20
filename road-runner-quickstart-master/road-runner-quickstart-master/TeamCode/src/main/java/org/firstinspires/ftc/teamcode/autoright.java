package org.firstinspires.ftc.teamcode;
import com.acmerobotics.roadrunner.Pose2d;
import com.acmerobotics.roadrunner.TrajectoryActionBuilder;
import com.acmerobotics.roadrunner.Vector2d;
import com.acmerobotics.roadrunner.ftc.Actions;
import com.qualcomm.robotcore.eventloop.opmode.Autonomous;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.CRServo;

@Autonomous(name = "autoright", group = "Autonomous")
public class autoright extends LinearOpMode {
    private DcMotor longMotor;   // Slide motor
    private DcMotor highMotor;   // Pitch motor
    private CRServo claw;        // Claw servo

    private static final double DEFAULT_UP_POWER = 0.8;
    private static final double DEFAULT_DOWN_POWER = 0.4;
    private static final double HOLD_POWER = 0.1;
    private static final double IDLE_POWER = 0.0;

    private int currentSlidePosition = 0;
    private int currentPitchPosition = 0;

    @Override
    public void runOpMode() {
        Pose2d initialPose = new Pose2d(0, 0, Math.toRadians(90));
        MecanumDrive drive = new MecanumDrive(hardwareMap, initialPose);

        initializeHardware();

        waitForStart();

        if (isStopRequested()) return;

        // Initial pitch movement
        movePitch(50, 0.4);

        // First trajectory and pitch movement
        TrajectoryActionBuilder tab1 = drive.actionBuilder(initialPose)
                .strafeTo(new Vector2d(0, 34));

        Actions.runBlocking(tab1.build());

        // After reaching position, move pitch
        movePitch(480, 0.5);
        sleep(100); // Small delay to ensure stability
        setPitchIdle(); // Explicitly set to hold position

        movePitch(100, 0.7);
        sleep(100); // Small delay to ensure stability
        setPitchIdle(); // Explicitly set to hold position

        // Second trajectory
        TrajectoryActionBuilder tab2 = drive.actionBuilder(drive.localizer.getPose())
                .strafeTo(new Vector2d(0, 30))
                .strafeTo(new Vector2d(30, 30));

        Actions.runBlocking(tab2.build());
    }

    private void initializeHardware() {
        longMotor = hardwareMap.get(DcMotor.class, "long");
        highMotor = hardwareMap.get(DcMotor.class, "high");
        claw = hardwareMap.get(CRServo.class, "claw");

        // Configure motor behavior
        longMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        highMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);

        longMotor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        highMotor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);

        // Store initial positions
        currentSlidePosition = longMotor.getCurrentPosition();
        currentPitchPosition = highMotor.getCurrentPosition();
    }

    private void moveSlide(int targetPosition, double power) {
        longMotor.setTargetPosition(targetPosition);
        longMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        longMotor.setPower(Math.abs(power));

        while (opModeIsActive() && longMotor.isBusy()) {
            telemetry.addData("Slide Position", longMotor.getCurrentPosition());
            telemetry.update();
        }

        currentSlidePosition = longMotor.getCurrentPosition();
        setSlideIdle();  // Sets to hold power after movement
    }

    private void movePitch(int targetPosition, double power) {
        highMotor.setTargetPosition(targetPosition);
        highMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        highMotor.setPower(Math.abs(power));

        while (opModeIsActive() && highMotor.isBusy()) {
            telemetry.addData("Pitch Position", highMotor.getCurrentPosition());
            telemetry.update();
        }

        currentPitchPosition = highMotor.getCurrentPosition();
        setPitchIdle();  // Sets to hold power after movement
    }

    private void setSlideIdle() {
        if (currentSlidePosition > 100) {  // If lifted, use hold power
            longMotor.setPower(HOLD_POWER);
        } else {  // If near bottom, use idle power
            longMotor.setPower(IDLE_POWER);
        }
    }

    private void setPitchIdle() {
        if (currentPitchPosition > 100) {  // If lifted, use hold power
            highMotor.setPower(HOLD_POWER);
        } else {  // If near bottom, use idle power
            highMotor.setPower(IDLE_POWER);
        }
    }
}